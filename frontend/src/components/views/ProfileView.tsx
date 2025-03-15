import React, { useEffect, useState } from "react";
import { getFirebaseToken } from "../../auth/firebaseToken";
import { getAuth, updateProfile, signOut, deleteUser } from "firebase/auth";

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await getFirebaseToken();
        const response = await fetch("http://localhost:8000/profile/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Profile Data:", data);
        setProfile(data.profile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      alert("Account deleted successfully!");
      setProfile(null);
    } catch (err: any) {
      alert("Failed to delete account: " + err.message);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-6">Profile</h2>

      {loading ? (
        <p className="text-[#7d8590]">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : profile ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile.photo_url || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-20 h-20 rounded-full border border-[#30363d]"
            />
            <div>
              <h3 className="text-lg font-medium">{profile.display_name || "N/A"}</h3>
              <p className="text-sm text-[#7d8590]">{profile.email || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[#7d8590]">No profile found.</p>
      )}
    </div>
  );
};
