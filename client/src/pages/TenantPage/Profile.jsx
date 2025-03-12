import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const userId = localStorage.getItem("_id"); // Retrieve userId from localStorage
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        roomNo: '',
        address: '',
        birthdate: '',
        gender: '',
        email: '',
        phoneNumber: '',
        password: '',
        profileImage: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false); // Show/Hide password fields
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Fetch user data when component mounts
        const fetchUserData = async () => {
            try {
                console.log(`Fetching user data for userId: ${userId}`);
                const response = await axios.get(`http://dormaitory.online:8080/api/users/${userId}`);
                const userData = response.data;
                setProfile({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roomNo: userData.roomNo,
                    address: userData.address,
                    birthdate: userData.birthdate.split('T')[0], // Format birthdate correctly
                    gender: userData.gender,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    password: '', // Do not pre-fill password
                    profileImage: userData.profileImage
                });
                if (userData.profileImage) {
                    setProfileImage(userData.profileImage);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Something went wrong! Please try again.');
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Set the base64 string as profileImage
            };
            reader.readAsDataURL(file);
        } else {
            setProfileImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const updateData = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                roomNo: profile.roomNo,
                address: profile.address,
                birthdate: profile.birthdate,
                gender: profile.gender,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                profileImage: profileImage, // Include the base64 string
            };
            if (showPasswordFields) {
                updateData.oldPassword = passwords.oldPassword;
                updateData.newPassword = passwords.newPassword;
            }

            console.log(`Updating user data for userId: ${userId}`);
            const response = await axios.put(`http://dormaitory.online:8080/api/users/${userId}`, updateData);

            if (response.status === 200) {
                console.log('Profile updated successfully');
                setSuccess('Profile updated successfully');

                // Reload the page to reflect the updated profile information
                window.location.reload();
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Something went wrong! Please try again.');
        }
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
                {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">{success}</div>}
                <div className="flex items-center justify-between mb-6">
                    <div
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {profileImage ? (
                            <img src={typeof profileImage === 'string' ? profileImage : URL.createObjectURL(profileImage)} alt="Profile" className="w-full h-full object-cover" />
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
                            <label className="text-gray-500 block mb-1" htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                            <label className="text-gray-500 block mb-1" htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                                placeholder="Enter your last name"
                            />
                        </div>
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

                {/* Room No */}
                <div className="bg-gray-100 p-3 rounded mb-4">
                    <label className="text-gray-500 block mb-1" htmlFor="roomNo">Room No</label>
                    <input
                        id="roomNo"
                        name="roomNo"
                        value={profile.roomNo}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
                        placeholder="Enter your room number"
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