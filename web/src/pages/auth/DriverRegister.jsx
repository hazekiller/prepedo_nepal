import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Upload } from 'lucide-react';
import { Button, Input } from '../../components/common/UI';
import api from '../../api';

const DriverRegisterPage = () => {
    // ... similar to Register but with driver fields (license, vehicle info)
    // Minimizing for brevity, can be expanded
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '',
        vehicleType: 'taxi', vehicleNumber: '', licenseNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post('/api/drivers/register', formData);
            if (response.data.success) navigate('/login');
        } catch (error) {
            alert('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-lg glass p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <Car className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">Become a Driver</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Vehicle Plate No" value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                        <Input label="License No" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/register" className="text-sm text-gray-400">Back to User Registration</Link>
                </div>
            </div>
        </div>
    );
};

export default DriverRegisterPage;
