import { useEffect, useState } from "react";
import api from "../api/api";

export default function UpdateProfile() {
    const [name, setName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* ---------- Load current user ---------- */
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get("/users/me");
                setName(res.data.name || "");
                setProfileImageUrl(res.data.profileImageUrl || "");
            } catch (err) {
                console.error(err);
            }
        };

        loadProfile();
    }, []);

    /* ---------- Upload image ---------- */
    const uploadImage = async (file) => {
        if (!file) return;

        try {
            setUploading(true);
            setError("");
            setMessage("");

            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Cloudinary URL
            setProfileImageUrl(res.data.url);

        } catch (err) {
            setError("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    /* ---------- Save profile ---------- */
    const saveProfile = async () => {
        if (!name) {
            setError("Name cannot be empty");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            await api.put("/users/me", {
                name,
                profileImageUrl,
            });

            setMessage("Profile updated successfully ✅");
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center">
            <div className="bg-gray-900 w-full max-w-md p-6 rounded-lg shadow-lg">

                <h2 className="text-xl font-semibold text-white mb-4 text-center">
                    Update Profile
                </h2>

                {error && (
                    <p className="text-red-400 text-sm text-center mb-3">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-green-400 text-sm text-center mb-3">
                        {message}
                    </p>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt="profile"
                            className="w-24 h-24 rounded-full object-cover mb-2"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-2">
                            No Image
                        </div>
                    )}

                    <label className="text-sm text-blue-400 cursor-pointer">
                        {uploading ? "Uploading..." : "Change photo"}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => uploadImage(e.target.files[0])}
                        />
                    </label>
                </div>

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">
                        Name
                    </label>
                    <input
                        className="w-full bg-gray-800 text-white rounded px-3 py-2
                       placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                {/* Save */}
                <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
