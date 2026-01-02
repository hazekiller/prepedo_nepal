import React from 'react';
import { Shield, Lock, AlertTriangle, UserCheck } from 'lucide-react';

const Safety = () => {
    return (
        <div className="bg-black text-white min-h-screen pt-20">
            {/* Hero */}
            <div className="bg-zinc-900 py-20 px-6 text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Safety is our Priority</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    We are committed to the safety of everyone using Prepedo. From creating new standards to developing technology, we take every step to minimalize incidents.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-primary">For Riders</h2>
                        <ul className="space-y-8">
                            <SafetyPoint
                                icon={<UserCheck />}
                                title="Trusted Drivers"
                                desc="Every driver undergoes a multi-step vetting process, including document verification and background checks."
                            />
                            <SafetyPoint
                                icon={<Lock />}
                                title="Data Privacy"
                                desc="Your personal information is always encrypted. We mask phone numbers so contact is anonymous."
                            />
                            <SafetyPoint
                                icon={<AlertTriangle />}
                                title="Emergency Assistance"
                                desc="Our in-app SOS button connects you directly to local authorities and our safety response team."
                            />
                        </ul>
                    </div>
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-white/10 h-full flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=800" className="rounded-2xl shadow-2xl opacity-80" alt="Safe Ride" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-white/10 h-full flex items-center justify-center order-2 md:order-1">
                        <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800" className="rounded-2xl shadow-2xl opacity-80" alt="Driver Safety" />
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold mb-6 text-primary">For Drivers</h2>
                        <ul className="space-y-8">
                            <SafetyPoint
                                icon={<Shield />}
                                title="Insurance Coverage"
                                desc="We provide insurance coverage for accidents during every trip for both you and your vehicle."
                            />
                            <SafetyPoint
                                icon={<UserCheck />}
                                title="Rider Verification"
                                desc="We verify rider identities to ensure you know who you are picking up every time."
                            />
                            <SafetyPoint
                                icon={<Clock />} // Placeholder icon
                                title="24/7 Support"
                                desc="Our dedicated safety team is available around the clock to assist you with any incidents."
                            />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SafetyPoint = ({ icon, title, desc }) => (
    <div className="flex gap-4">
        <div className="mt-1 p-2 bg-white/10 rounded-lg h-fit text-primary">{icon}</div>
        <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Safety;
