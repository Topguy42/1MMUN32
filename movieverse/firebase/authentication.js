import { auth, db, googleProvider } from "./config";
import {
  getAdditionalUserInfo,
  signInWithPopup,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from 'react-toastify'


export const signinwithGoogle = async () => {
  try {
    const data = await signInWithPopup(auth, googleProvider);

    if (data) {
      const isNewUser = getAdditionalUserInfo(data)?.isNewUser;

      if (isNewUser) {
        const { displayName, email, photoURL, emailVerified, uid } =
          data?.user;

        if (displayName && email) {
          createNewUserProfile({
            displayName,
            email,
            emailVerified,
            uid,
            photoURL: photoURL ?? "",
          });
        }

        toast(`Welcome back, Adventurer ${displayName}`)
      }
      else toast("Welcome, New Adventurer")
    } else toast("some unknown error occured.");


  } catch (err) {
    console.error(err);
  }
}


export const createNewUserProfile = async (userdetails) => {
  const { displayName, email, photoURL, emailVerified, uid } = userdetails;

  if (!uid || !userdetails) {
    throw new Error("Method requires uid and userdetails.");
  }

  try {
    await setDoc(doc(db, "users", uid), {
      uid: uid,
      name: displayName,
      email: email,
      photo: photoURL,
      emailVerified: emailVerified,
      description: "",
      banner: "",
      shortTitle: "",
      episodesWatched: 0,
      moviesWatched: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error setting user document: ", error);
    throw new Error("Failed to add user. Please try again later.");
  }
};