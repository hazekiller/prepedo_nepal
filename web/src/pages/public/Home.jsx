import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Smartphone, Shield, Clock, Map, Star, Users, Briefcase, ChevronDown } from 'lucide-react';
import { Button } from '../../components/common/UI';

const Home = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="overflow-hidden bg-black text-white">
            {/* --- Hero Section --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden pt-20">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-300">Live in Kathmandu Valley</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                            The Smart Way to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Explore Nepal</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                            Prepedo connects you with verified drivers for safe, fast, and reliable rides. Experience premium mobility at your fingertips.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="!px-8 !py-4 text-lg items-center gap-3 group">
                                Download App <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" className="!px-8 !py-4 text-lg border-white/20 hover:bg-white/5">
                                Driver Signup
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-gray-400">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">50k+</span>
                                <span className="text-sm">Downloads</span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">4.8</span>
                                <span className="text-sm">User Rating</span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">24/7</span>
                                <span className="text-sm">Support</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div style={{ y: y1 }} className="relative hidden lg:block">
                        {/* Abstract Phone Composition */}
                        <div className="relative z-10 w-[320px] mx-auto">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <img
                                src="https://images.unsplash.com/photo-1512428559087-560fa5ce7d75?auto=format&fit=crop&q=80&w=800"
                                alt="App Screen"
                                className="relative rounded-[3rem] border-8 border-zinc-900 shadow-2xl rotate-[-6deg] hover:rotate-0 transition-all duration-700 ease-out"
                            />
                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-20 -right-12 bg-zinc-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Driver Arriving</p>
                                        <p className="font-bold">2 mins</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- Features Grid --- */}
            <section className="py-24 bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose Prepedo?</h2>
                        <p className="text-gray-400 text-lg">We didn't just build an app; we built a seamless travel experience designed for the unique needs of Nepal.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-10 h-10 text-primary" />}
                            title="Safety First"
                            desc="Every ride is tracked in real-time. Our SOS feature and vetted drivers ensure your journey is always secure."
                        />
                        <FeatureCard
                            icon={<Map className="w-10 h-10 text-primary" />}
                            title="Smart Navigation"
                            desc="Our localized mapping system finds the quickest routes through Kathmandu's complex streets."
                        />
                        <FeatureCard
                            icon={<Briefcase className="w-10 h-10 text-primary" />}
                            title="Corporate Rides"
                            desc="Simplified billing and priority booking for business travel. Manage your team's mobility effortlessly."
                        />
                    </div>
                </div>
            </section>

            {/* --- How It Works --- */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Booking a ride is easier than ever</h2>
                            <div className="space-y-8">
                                <Step
                                    number="01"
                                    title="Set Location"
                                    desc="Open the app and enter your destination. Our smart GPS will detect your pickup point."
                                />
                                <Step
                                    number="02"
                                    title="Choose Ride"
                                    desc="Select from Bike, Taxi, or Premium Car. See estimated fares upfront."
                                />
                                <Step
                                    number="03"
                                    title="Enjoy Journey"
                                    desc="Track your driver in real-time. Pay via Cash, Esewa, or Khalti upon arrival."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                            <img
                                src="https://images.unsplash.com/photo-1617781377508-41074b122dd1?auto=format&fit=crop&q=80&w=800"
                                alt="User using app"
                                className="relative rounded-3xl border border-white/10 shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Driver CTA --- */}
            <section className="py-24 bg-primary text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl lg:text-6xl font-black mb-6 uppercase tracking-tight">Earn on your terms</h2>
                    <p className="text-xl lg:text-2xl font-medium mb-10 max-w-2xl mx-auto opacity-90">
                        Join thousands of drivers in Nepal earning daily. Low commission, instant payouts, and full flexibility.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => window.location.href = '/register/driver'} className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors shadow-2xl">
                            Register as Driver
                        </button>
                    </div>
                </div>
            </section>

            {/* --- Download Section --- */}
            <section className="py-32 relative">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-8">Ready to ride?</h2>
                    <p className="text-xl text-gray-400 mb-12">Download the Prepedo app today and get 50% off your first ride.</p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="#" className="flex items-center gap-4 bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl hover:bg-zinc-800 transition-all group">
                            <SimpleIconApple className="w-8 h-8 group-hover:text-white" />
                            <div className="text-left">
                                <span className="block text-xs text-gray-500">Download on the</span>
                                <span className="block text-lg font-bold">App Store</span>
                            </div>
                        </a>
                        <a href="#" className="flex items-center gap-4 bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl hover:bg-zinc-800 transition-all group">
                            <SimpleIconAndriod className="w-8 h-8 group-hover:text-green-500" />
                            <div className="text-left">
                                <span className="block text-xs text-gray-500">Get it on</span>
                                <span className="block text-lg font-bold">Google Play</span>
                            </div>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group">
        <div className="mb-6 p-4 bg-black/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
    </div>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-6">
        <span className="text-4xl font-black text-primary/30">{number}</span>
        <div>
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-gray-400">{desc}</p>
        </div>
    </div>
);

// Simple SVG Icons
const SimpleIconApple = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.8-.71 1.59.18 2.53.81 3.23 1.83-2.88 1.76-2.4 6.13.56 7.34-.69 1.76-1.58 3.16-2.67 3.77zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.29-2.04 4.34-3.74 4.25z" /></svg>
);

const SimpleIconAndriod = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.0022 13.8388 7.424 12 7.424s-3.5902.5782-5.1364 1.5264L4.8413 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" /></svg>
);

export default Home;
