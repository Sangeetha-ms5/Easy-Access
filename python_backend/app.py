from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from twilio.rest import Client

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    otp = db.Column(db.String(10), nullable=True)
    otp_created_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

with app.app_context():
    db.create_all()

OTP_STORE = {}

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER', '')

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_sms(otp: str, phone: str):
    if not twilio_client or not TWILIO_FROM_NUMBER:
        return False, 'Twilio is not configured yet; OTP was generated locally only.'

    try:
        message = twilio_client.messages.create(
            body=f'Your Easy Access OTP is {otp}',
            from_=TWILIO_FROM_NUMBER,
            to=phone,
        )
        return True, message.sid
    except Exception as exc:
        return False, str(exc)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json(silent=True) or {}
    phone = data.get('phone', '').strip()
    full_name = data.get('full_name', '').strip()

    if not phone:
        return jsonify({'success': False, 'message': 'Phone number is required'}), 400

    if not full_name:
        return jsonify({'success': False, 'message': 'Full name is required'}), 400

    otp = f"{123456 + len(phone) % 900000:06d}"
    OTP_STORE[phone] = {'otp': otp, 'full_name': full_name, 'created_at': datetime.utcnow()}

    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = User(full_name=full_name, phone=phone)
        db.session.add(user)
        db.session.commit()

    user.otp = otp
    user.otp_created_at = datetime.utcnow()
    db.session.commit()

    sms_sent, sms_detail = send_sms(otp, phone)
    return jsonify({
        'success': True,
        'message': 'OTP sent' if sms_sent else 'OTP generated locally; configure Twilio to send SMS',
        'otp': otp,
        'sms_sent': sms_sent,
        'sms_detail': sms_detail,
    })

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = data.get('phone', '').strip()
    otp = data.get('otp', '').strip()

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if user.otp != otp:
        return jsonify({'success': False, 'message': 'Invalid OTP'}), 401

    user.otp = None
    user.otp_created_at = None
    db.session.commit()

    return jsonify({'success': True, 'message': 'Login successful', 'user': user.to_dict()})

@app.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


@app.route('/login-data', methods=['GET'])
def login_data():
    users = User.query.all()
    return jsonify({'count': len(users), 'users': [u.to_dict() for u in users]})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
