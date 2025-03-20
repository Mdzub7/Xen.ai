import React, { useEffect, useState, useCallback } from "react";
import { getFirebaseToken } from "../../auth/firebaseToken";
import { getAuth, deleteUser } from "firebase/auth";

interface ProfileData {
  display_name: string;
  email: string;
  photo_url: string;
}

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const auth = getAuth();

  const fetchProfile = useCallback(async () => {
    if (!loading) setLoading(true);
    
    try {
      const token = await getFirebaseToken();
      const response = await fetch("http://localhost:8000/profile/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Add cache control for better performance
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched Profile Data:", data);
      setProfile(data.profile);
      setError(null);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteUser(auth.currentUser);
      setProfile(null);
      alert("Account deleted successfully!");
    } catch (err: any) {
      console.error("Delete account error:", err);
      alert("Failed to delete account: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchProfile();
  };

  const defaultAvatar = "https://img.freepik.com/free-psd/contact-icon-illustration-isolated_23-2151903337.jpg?t=st=1742204766~exp=1742208366~hmac=28fee7bfac77754bce4ccdab72ea9cee0a12104d39718b678680e7b995245fa0&w=826";

  return (
    <div className="h-full bg-gradient-to-b from-[#0A192F] via-[#0F1A2B] to-black text-white p-6">
      <h2 className="text-xl font-semibold text-[#e6edf3] mb-6">Profile</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-[#7d8590]">Loading your profile...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm transition"
          >
            Try Again
          </button>
        </div>
      ) : profile ? (
        <div className="space-y-8 bg-[#0d2138]/50 p-6 rounded-lg border border-[#30363d]">
          <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
            <div className="relative">
              <img
                src={profile.photo_url || defaultAvatar}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-[#30363d] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = defaultAvatar;
                }}
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-medium text-[#e6edf3]">
                {profile.display_name || "User"}
              </h3>
              <p className="text-sm text-[#7d8590]">{profile.email || "No email available"}</p>
              <p className="text-xs text-[#7d8590] mt-2">Member since {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`w-full ${isDeleting ? 'bg-red-800' : 'bg-red-600 hover:bg-red-700'} 
                text-white px-4 py-3 rounded-lg transition flex items-center justify-center`}
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[#7d8590] mb-4">No profile found.</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};