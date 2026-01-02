import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button, Input } from '../../components/common/UI';

const Contact = () => {
    return (
        <div className="bg-black text-white min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-gray-400 text-lg">We'd love to hear from you. Our team is always here to chat.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div className="bg-zinc-900 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-primary w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold">Headquarters</p>
                                        <p className="text-gray-400">Thamel Marg, Kathmandu 44600,<br />Nepal</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="text-primary w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold">Email Us</p>
                                        <p className="text-gray-400">support@prepedo.com</p>
                                        <p className="text-gray-400">partners@prepedo.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="text-primary w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold">Call Us</p>
                                        <p className="text-gray-400">+977 9800000000</p>
                                        <p className="text-gray-400 font-sm">(Sun-Fri, 9am - 6pm)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary text-black p-8 rounded-2xl">
                            <h3 className="text-xl font-bold mb-2">Driver Support</h3>
                            <p className="mb-4 opacity-90">Are you a driver needing immediate assistance? Use our dedicated driver hotline.</p>
                            <p className="text-2xl font-black">+977 1 4455667</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-white/10">
                        <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormInput label="First Name" placeholder="John" />
                                <FormInput label="Last Name" placeholder="Doe" />
                            </div>
                            <FormInput label="Email" type="email" placeholder="john@example.com" />
                            <FormInput label="Subject" placeholder="How can we help?" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Message</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-primary focus:outline-none min-h-[150px]"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>

                            <Button className="w-full flex justify-center items-center gap-2">
                                Send Message <Send size={18} />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, type = "text", placeholder }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <input
            type={type}
            className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
            placeholder={placeholder}
        />
    </div>
);

export default Contact;
