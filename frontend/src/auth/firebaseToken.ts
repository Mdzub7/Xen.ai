import { auth } from "../components/auth/firebase"; 

export async function getFirebaseToken() {
    const user = auth.currentUser; 
    if (!user) {
        console.log("User not there");
        return null;
    }
    
    try {
        const token = await user.getIdToken(true);
        console.log(token);
        return token;
    } catch (error) {
        console.error("Error getting Firebase token:", error);
        return null;
    }
}
