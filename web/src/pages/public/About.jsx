import React from 'react';
import { Shield, Clock, Map, Users, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-black text-white min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">About Prepedo Nepal</h1>

                <section className="mb-16">
                    <p className="text-xl text-gray-300 leading-relaxed mb-6">
                        Prepedo is Nepal's homegrown ride-sharing platform, designed to revolutionize how people move through our vibrant cities. We combine cutting-edge technology with a deep understanding of local transportation needs to not just offer a service, but a solution.
                    </p>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        Founded in 2024, our mission is simple: to make transportation safer, more reliable, and accessible for everyone in Nepal. Whether you're navigating the bustling streets of Kathmandu or commuting to work, Prepedo is your trusted partner.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="space-y-4">
                        <div className="bg-primary/20 p-4 rounded-xl w-fit">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Community First</h3>
                        <p className="text-gray-400">We prioritize the well-being of both our riders and drivers, fostering a community of mutual respect and trust.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-primary/20 p-4 rounded-xl w-fit">
                            <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Local Heart</h3>
                        <p className="text-gray-400">Built in Nepal, for Nepal. We understand the unique challenges of our cities and adapt our technology to solve them.</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-3xl p-10 border border-white/10 text-center">
                    <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        To be the leading mobility platform in Nepal, powering the movement of people and things with safety, integrity, and innovation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
