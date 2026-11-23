import { useState } from 'react';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiInstagram, FiFacebook } from 'react-icons/fi';

const WHATSAPP = 'https://wa.me/917872308154';
const EMAIL = 'ishikafragrances@gmail.com';

const EMPTY_FORM = { name: '', contact: '', interest: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const buildMessage = () => {
    const lines = [
      'Hello Ishika Fragrances,',
      form.name.trim() && `My name is ${form.name.trim()}.`,
      form.interest.trim() && `I am interested in: ${form.interest.trim()}.`,
      form.message.trim(),
      form.contact.trim() && `You can reach me at ${form.contact.trim()}.`,
    ];
    return lines.filter(Boolean).join('\n');
  };

  const sendOnWhatsApp = (e) => {
    e.preventDefault();
    const url = `${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const sendByEmail = () => {
    const subject = form.interest.trim()
      ? `Enquiry: ${form.interest.trim()}`
      : 'Fragrance enquiry';
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(buildMessage())}`;
    setSent(true);
  };

  return (
    <section id="contact" className="section contact">
      <div className="shell">
        <div className="section-head fade-in">
          <div>
            <p className="eyebrow">03 / Enquiries</p>
            <h2 className="section-title">
              Let’s talk about
              <br />
              <em>your line.</em>
            </h2>
          </div>
          <div className="section-head__aside">
            <p className="lede">
              Call or write with the fragrances you are interested in and we will get back to
              you promptly — with pricing, minimum order quantities and availability.
            </p>
          </div>
        </div>

        <div className="contact__frame fade-in">
          <div className="contact__panel">
            <div>
              <p className="eyebrow eyebrow--light">Direct line to the unit</p>
              <h3 className="contact__title">
                Tell us what you are <em>making.</em>
              </h3>
              <p className="contact__desc">
                Share a fragrance name, a scent family, or the profile you have in mind. We
                answer as the people who actually make it.
              </p>
            </div>

            <dl className="contact__list">
              <div className="contact__row">
                <dt>
                  <Phone size={12} strokeWidth={2} aria-hidden="true" />
                  Phone
                </dt>
                <dd>
                  <a href="tel:7872308154" className="contact__value contact__value--lg">
                    7872308154
                  </a>
                  <a href="tel:8768919981" className="contact__value contact__value--lg">
                    8768919981
                  </a>
                </dd>
              </div>

              <div className="contact__row">
                <dt>
                  <Mail size={12} strokeWidth={2} aria-hidden="true" />
                  Email
                </dt>
                <dd>
                  <a href={`mailto:${EMAIL}`} className="contact__value">
                    {EMAIL}
                  </a>
                </dd>
              </div>

              <div className="contact__row">
                <dt>
                  <MapPin size={12} strokeWidth={2} aria-hidden="true" />
                  Unit
                </dt>
                <dd>
                  <span className="contact__value">
                    East Medinipur,
                    <br />
                    West Bengal – 721633
                  </span>
                </dd>
              </div>
            </dl>

            <div className="contact__socials">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="social social--light"
                aria-label="Chat on WhatsApp"
              >
                <FaWhatsapp size={17} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social social--light"
                aria-label="Instagram"
              >
                <FiInstagram size={17} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social social--light"
                aria-label="Facebook"
              >
                <FiFacebook size={17} />
              </a>
            </div>
          </div>

          <div className="enquiry">
            <div className="enquiry__head">
              <h3 className="enquiry__title">Send an enquiry</h3>
              <p className="enquiry__hint">No account · No payment · Just a conversation</p>
            </div>

            <form className="enquiry__form" onSubmit={sendOnWhatsApp}>
              <div className="field--row">
                <div className="field">
                  <label htmlFor="enq-name">Your name</label>
                  <input
                    id="enq-name"
                    name="name"
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={update('name')}
                  />
                </div>
                <div className="field">
                  <label htmlFor="enq-contact">Phone or email</label>
                  <input
                    id="enq-contact"
                    name="contact"
                    type="text"
                    placeholder="How we can reach you"
                    autoComplete="tel"
                    value={form.contact}
                    onChange={update('contact')}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="enq-interest">Fragrances of interest</label>
                <input
                  id="enq-interest"
                  name="interest"
                  type="text"
                  placeholder="e.g. Amber, Sandalwood, Mogra"
                  value={form.interest}
                  onChange={update('interest')}
                />
              </div>

              <div className="field">
                <label htmlFor="enq-message">Message</label>
                <textarea
                  id="enq-message"
                  name="message"
                  rows={3}
                  placeholder="Quantities, delivery location, or a scent profile you have in mind…"
                  required
                  value={form.message}
                  onChange={update('message')}
                />
              </div>

              <div className="enquiry__actions">
                <button type="submit" className="btn btn--solid">
                  Send on WhatsApp
                  <ArrowRight size={15} strokeWidth={2} />
                </button>
                <button type="button" className="btn btn--ghost" onClick={sendByEmail}>
                  Email instead
                </button>
              </div>

              <p className="enquiry__note">
                This opens WhatsApp or your mail app with the message ready to send. Nothing
                is stored on this site.
              </p>

              {sent && (
                <p className="enquiry__status" role="status">
                  Your message is ready — press send in WhatsApp or your mail app. If nothing
                  opened, call 7872308154.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
