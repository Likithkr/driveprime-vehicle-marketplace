import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone, FiMail } from 'react-icons/fi';

export default function ContactButtons({ phone, email, whatsapp, carName, style = {} }) {
    const msg = encodeURIComponent(`Hi! I'm interested in the ${carName} listed on DrivePrime. Please share more details.`);
    const subject = encodeURIComponent(`Enquiry: ${carName} — DrivePrime`);
    const body = encodeURIComponent(`Hello,\n\nI am interested in the ${carName} listed on DrivePrime.\n\nPlease contact me with more details.\n\nThank you.`);

    return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', ...style }}>
            <a
                href={`https://wa.me/91${whatsapp || phone}?text=${msg}`}
                target="_blank" rel="noopener noreferrer"
                className="btn"
                style={{
                    flex: 1, minWidth: '120px',
                    background: '#25d366', color: '#fff',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                    justifyContent: 'center',
                }}
            >
                <FaWhatsapp size={18} /> WhatsApp
            </a>
            <a
                href={`tel:+91${phone}`}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: '100px', justifyContent: 'center' }}
            >
                <FiPhone size={16} /> Call
            </a>
            <a
                href={`mailto:${email}?subject=${subject}&body=${body}`}
                className="btn btn-outline"
                style={{ flex: 1, minWidth: '100px', justifyContent: 'center' }}
            >
                <FiMail size={16} /> Email
            </a>
        </div>
    );
}
