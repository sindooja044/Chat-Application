// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {getFirestore, doc, setDoc, getDoc, getDocs} from "firebase/firestore";
import { toast } from "react-toastify";
import { collection } from 'firebase/firestore';
import { query } from 'firebase/firestore';
import { where } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyD8yEVmIc-LGbU7hkhZsp-ysqB45YjpaqM",
  authDomain: "chat-app-62681.firebaseapp.com",
  projectId: "chat-app-62681",
  storageBucket: "chat-app-62681.firebasestorage.app",
  messagingSenderId: "533027937326",
  appId: "1:533027937326:web:4b5da3ebf4517462b493bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=  getFirestore(app);
const signup=async (username,email, password)=>{
  try{
    const res=await createUserWithEmailAndPassword(auth,email,password)
    const user=res.user;
    await setDoc(doc(db,"users",user.uid),{
      id:user.uid,
      username:username.toLowerCase(),
      email,
      name:"",
      avatar:"",
      bio:"hey, there I am using chat app",
      lastSeen:Date.now()
    })  
    await setDoc (doc(db,"chats",user.uid),{
      chatsData:[]

    })  
  }catch(error){
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));

  }
}


const login = async (email,password)=>{
  try{
    await signInWithEmailAndPassword(auth,email,password);  //recived from above
  }catch(error){
    console.error(error)
    toast.error(error.code.split("/")[1].split("-").join(" "));

  }
}

const logout = async ()=>{
  try{
    await signOut(auth);  //recived from above
  }catch(error){
    console.error(error)
    toast.error(error.code.split("/")[1].split("-").join(" "));

  }
}

const resetPass=async (email)=>{
  if(!email){
    toast.error("Enter our email");
    return null;
  }
  try {
    const userRef=collection(db,'users') //users data 
    const q=query(userRef,where("email","==",email)); //query if user email ==email or <!-- Nav tabs -->
    const querySnap=await getDocs(q);   //get perticular user
    if (!querySnap.empty){                 //if user not empty  
      await sendPasswordResetEmail(auth,email);
      toast.success("Reset Email Sent")
    }
    else{
      toast.error("Email doesn't exists")
    }
    
  } catch(error){
    console.error(error);
    toast.error(error.message);
  }
}
export {signup,login,logout,auth,db,resetPass}