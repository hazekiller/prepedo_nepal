import React, { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button, Input } from '../../components/common/UI';
import api from '../../api';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/admin/settings', settings);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">Loading settings...</div>;

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">System Configuration</h1>
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid gap-8">
                {/* Pricing Section */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Vehicle Pricing</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Bike */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary">Bike</h4>
                            <Input
                                label="Base Fare (NPR)"
                                type="number"
                                value={settings.base_fare_bike || ''}
                                onChange={e => handleChange('base_fare_bike', e.target.value)}
                            />
                            <Input
                                label="Per KM Fare (NPR)"
                                type="number"
                                value={settings.per_km_fare_bike || ''}
                                onChange={e => handleChange('per_km_fare_bike', e.target.value)}
                            />
                        </div>
                        {/* Car */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary">Car (Premium)</h4>
                            <Input
                                label="Base Fare (NPR)"
                                type="number"
                                value={settings.base_fare_car || ''}
                                onChange={e => handleChange('base_fare_car', e.target.value)}
                            />
                            <Input
                                label="Per KM Fare (NPR)"
                                type="number"
                                value={settings.per_km_fare_car || ''}
                                onChange={e => handleChange('per_km_fare_car', e.target.value)}
                            />
                        </div>
                        {/* Taxi */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary">Taxi</h4>
                            <Input
                                label="Base Fare (NPR)"
                                type="number"
                                value={settings.base_fare_taxi || ''}
                                onChange={e => handleChange('base_fare_taxi', e.target.value)}
                            />
                            <Input
                                label="Per KM Fare (NPR)"
                                type="number"
                                value={settings.per_km_fare_taxi || ''}
                                onChange={e => handleChange('per_km_fare_taxi', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Surge & Commission Section */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Revenue & Surge Control</h3>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-300">Surge Multipliers (1.0 = Normal)</h4>
                            <Input
                                label="Morning Rush (8am-11am)"
                                type="number"
                                step="0.1"
                                value={settings.surge_multiplier_morning || ''}
                                onChange={e => handleChange('surge_multiplier_morning', e.target.value)}
                            />
                            <Input
                                label="Evening Rush (4pm-8pm)"
                                type="number"
                                step="0.1"
                                value={settings.surge_multiplier_evening || ''}
                                onChange={e => handleChange('surge_multiplier_evening', e.target.value)}
                            />
                            <Input
                                label="Late Night (10pm-5am)"
                                type="number"
                                step="0.1"
                                value={settings.surge_multiplier_night || ''}
                                onChange={e => handleChange('surge_multiplier_night', e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-300">Platform Fees</h4>
                            <Input
                                label="Platform Commission (%)"
                                type="number"
                                value={settings.platform_commission || ''}
                                onChange={e => handleChange('platform_commission', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
