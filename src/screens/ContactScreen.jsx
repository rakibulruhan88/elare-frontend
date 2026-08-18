import { useState, useEffect } from 'react';
import { MdLocationOn, MdEmail, MdPhone, MdCheckCircle } from 'react-icons/md';
import { motion } from 'framer-motion';
import axios from 'axios';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await axios.post('/api/contact', { name, email, subject, message }, config);

      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setLoading(false);
      console.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      
      {/* Page Header */}
      <div className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white uppercase tracking-widest mb-4">
          Get in Touch
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          Have a question about our products, your order, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information (Left Side) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest mb-6">Contact Information</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Our customer service team is available Monday through Friday, 9:00 AM to 6:00 PM. We strive to respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-4 rounded-full text-gray-900">
                  <MdLocationOn className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Our Headquarters</h3>
                  <p className="text-sm text-gray-500">Banani, Dhaka - 1213<br />Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-4 rounded-full text-gray-900">
                  <MdEmail className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Email Us</h3>
                  <p className="text-sm text-gray-500">support@ELARE.com<br />sales@ELARE.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-4 rounded-full text-gray-900">
                  <MdPhone className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Call Us</h3>
                  <p className="text-sm text-gray-500">+880 1712-345678<br />+880 1987-654321</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form (Right Side) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-8">Send a Message</h2>
            
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 text-green-800 p-4 rounded-md flex items-center gap-2 mb-6 text-sm font-medium border border-green-200"
              >
                <MdCheckCircle className="text-lg" />
                Your message has been sent successfully. We will get back to you soon!
              </motion.div>
            )}

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none custom-scrollbar"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-md text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center h-14"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactScreen;