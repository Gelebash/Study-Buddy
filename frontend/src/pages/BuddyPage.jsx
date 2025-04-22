import React, { useState, useEffect } from 'react';
import '../styles/BuddyPage.css';
import BuddyNavBar from '../components/BuddyNavBar';
import api from '../api';
import { FaPaw } from 'react-icons/fa';

const petIcons = { Cat: "🐱", Fish: "🐠", Turtle: "🐢", Dog: "🐶", Bunny: "🐰", Hamster: "🐹", Reptile: "🦎", Default: "🐾" };

function BuddyPage() {
    const [buddyInfo, setBuddyInfo] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        stateName: '',
        countryName: '',
        petIdNumber: '',
        favoritePet: '',
        petHappiness: 50,
        petBirthDate: null
    });
    const [error, setError] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
        fetchBuddyInfo();
    }, []);

    const fetchBuddyInfo = async () => {
        try {
            const response = await api.get('/api/buddy/');
            if (response.data.length > 0) {
                setBuddyInfo(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching buddy info:", error);
        }
    };

    const handleEdit = (field, value) => {
        setEditingField(field);
        setTempValue(value || '');
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleSave = async (field) => {
        try {
            await api.patch('/api/buddy/1/update/', { [field]: tempValue });
            setBuddyInfo(prev => ({ ...prev, [field]: tempValue }));
            setEditingField(null);
            setTempValue('');
            setError('');
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            setError(`Failed to update ${field}. Please try again.`);
        }
    };

    const renderEditableField = (label, field, value) => {
        return (
            <div className="id-field-row">
                <div className="id-field">
                    <div className="id-label">{label}</div>
                    {editingField === field ? (
                        <div className="id-field-edit">
                            <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                            />
                            <div className="edit-button-container">
                                <button className="id-button save" onClick={() => handleSave(field)}>✓</button>
                                <button className="id-button cancel" onClick={handleCancel}>✕</button>
                            </div>
                        </div>
                    ) : (
                        <div className="id-value-edit-container">
                            <div className={`id-value ${field === 'petIdNumber' ? 'id-number-value' : ''}`}>
                                {value || <span className="placeholder-text">Not set</span>}
                            </div>
                            <button className="id-button edit" onClick={() => handleEdit(field, value)}>✎</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const petIcon = petIcons[buddyInfo.favoritePet] || petIcons.Default;

    return (
        <>
            <BuddyNavBar />
            <div className="buddy-body-id-horizontal">
                <div className="page-content">
                    <div className="buddy-page-container">
                        {error && <div className="id-target-error">{error}</div>}
                        <div className="buddy-id-card-horizontal">
                            <div className="id-realistic-header-bar">PET IDENTIFICATION CARD</div>
                            <div className="id-horizontal-content">
                                <div className="id-horizontal-photo-area">
                                    <span className="id-horizontal-photo">{petIcon}</span>
                                </div>
                                <div className="id-horizontal-details">
                                    <div className="main-info">
                                        {renderEditableField('ID NUMBER', 'petIdNumber', buddyInfo.petIdNumber)}
                                        <div className="id-field-row">
                                            <div className="id-field">
                                                <div className="id-label">NAME</div>
                                                {renderEditableField('First Name', 'firstName', buddyInfo.firstName)}
                                                {renderEditableField('Middle Name', 'middleName', buddyInfo.middleName)}
                                                {renderEditableField('Last Name', 'lastName', buddyInfo.lastName)}
                                            </div>
                                        </div>
                                        <div className="id-field-row">
                                            <div className="id-field">
                                                <div className="id-label">LOCATION</div>
                                                {renderEditableField('State', 'stateName', buddyInfo.stateName)}
                                                {renderEditableField('Country', 'countryName', buddyInfo.countryName)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="side-info">
                                        <div className="id-multi-field-row">
                                            <div className="id-field">
                                                <div className="id-label">SPECIES</div>
                                                <div className="id-value">{buddyInfo.favoritePet || 'Not set'}</div>
                                            </div>
                                            <div className="id-field">
                                                <div className="id-label">ISSUED</div>
                                                <div className="id-value">
                                                    {buddyInfo.petBirthDate 
                                                        ? new Date(buddyInfo.petBirthDate).toLocaleDateString() 
                                                        : 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="status-field">
                                            <div className="id-label">STATUS</div>
                                            <div>
                                                <div className={`id-value mood ${buddyInfo.petHappiness >= 50 ? 'happy' : 'upset'}`}>
                                                    {buddyInfo.petHappiness >= 50 ? 'Happy' : 'Needs Attention'}
                                                </div>
                                                <div className="id-target-bar-container">
                                                    <div 
                                                        className="id-target-bar" 
                                                        style={{ width: `${buddyInfo.petHappiness}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BuddyPage;