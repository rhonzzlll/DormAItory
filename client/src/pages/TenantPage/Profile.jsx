import React, { useState, useRef } from 'react';
import { User } from 'lucide-react';
 

const Profile = () => {
    const [profile, setProfile] = useState({
        fullName: '',
        tenantId: '',
        roomNo: '',
        address: '',
        birthdate: '',
        email: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false); // Show/Hide password fields
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prevPasswords => ({
            ...prevPasswords,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.substr(0, 5) === "image") {
            setProfileImage(URL.createObjectURL(file));
        } else {
            setProfileImage(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updated profile:', profile);
        console.log('Passwords:', passwords);
        // TODO: Implement API call to update profile and passwords
    };

    const handleCancelPasswordChange = () => {
        setShowPasswordFields(false);
        setPasswords({ oldPassword: '', newPassword: '' }); // Reset passwords
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-teal-600 text-white text-2xl font-bold py-4 px-6">
                My Profile
            </div>
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-gray-400" />
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div className="flex-grow ml-6">
                        <div className="bg-gray-100 p-3 rounded">
                            <label className="text-gray-500 block mb-1" htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>
                </div>

                {/* Tenant ID and Room No */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-100 p-3 rounded">
                        <label className="text-gray-500 block mb-1" htmlFor="tenantId">Tenant ID</label>
                        <input
                            id="tenantId"
                            name="tenantId"
                            value={profile.tenantId}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                            placeholder="Enter tenant ID"
                        />
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                        <label className="text-gray-500 block mb-1" htmlFor="roomNo">Room No.</label>
                        <input
                            id="roomNo"
                            name="roomNo"
                            value={profile.roomNo}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                            placeholder="Enter room number"
                        />
                    </div>
                </div>

                {/* Address and Birthdate */}
                <div className="bg-gray-100 p-3 rounded mb-4">
                    <label className="text-gray-500 block mb-1" htmlFor="address">Address</label>
                    <input
                        id="address"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                        placeholder="Enter your address"
                    />
                </div>
                <div className="bg-gray-100 p-3 rounded mb-4">
                    <label className="text-gray-500 block mb-1" htmlFor="birthdate">Birthdate</label>
                    <input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={profile.birthdate}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                    />
                </div>

                {/* Email */}
                <div className="bg-gray-100 p-3 rounded mb-4">
                    <label className="text-gray-500 block mb-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Password Change Section */}
                <div className="bg-gray-100 p-3 rounded mb-6">
                    <span className="text-gray-500 block mb-1">Password</span>
                    <div className="text-teal-600 font-semibold cursor-pointer" onClick={() => setShowPasswordFields(true)}>
                        Change Password
                    </div>
                </div>

                {/* Password Fields */}
                {showPasswordFields && (
                    <>
                        <div className="bg-gray-100 p-3 rounded mb-4">
                            <label className="text-gray-500 block mb-1" htmlFor="oldPassword">Old Password</label>
                            <input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                value={passwords.oldPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                                placeholder="Enter your old password"
                            />
                        </div>
                        <div className="bg-gray-100 p-3 rounded mb-4">
                            <label className="text-gray-500 block mb-1" htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                                placeholder="Enter your new password"
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mb-6">
                            <button
                                type="button"
                                onClick={handleCancelPasswordChange}
                                className="bg-gray-400 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {/* Save Changes Button */}
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 transition duration-300">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default Profile;