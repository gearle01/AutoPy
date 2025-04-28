// frontend/src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";

// Configuração do Firebase - use exatamente como está no seu console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB53oBb1iY5TMZnMWGoILLCPjJUPFglBdg",
  authDomain: "projeto-de-teste-b95d9.firebaseapp.com",
  projectId: "projeto-de-teste-b95d9",
  storageBucket: "projeto-de-teste-b95d9.appspot.com", // Corrigido
  messagingSenderId: "571089146356",
  appId: "1:571089146356:web:acd81c35b0b918460fa9a1"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Funções de autenticação
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Registra informações adicionais do usuário
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ip: await getIP()
    });
    
    console.log("Usuário registrado com sucesso:", user.uid);
    return user;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error.code, error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualiza a data de último acesso e IP
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp(),
      ip: await getIP()
    });
    
    console.log("Login bem-sucedido:", user.uid);
    return user;
  } catch (error) {
    console.error("Erro ao fazer login:", error.code, error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Logout bem-sucedido");
    return true;
  } catch (error) {
    console.error("Erro ao fazer logout:", error.code, error.message);
    throw error;
  }
};

// Funções de firestore
export const saveSettings = async (userId, settings) => {
  try {
    await setDoc(doc(db, "settings", userId), {
      ...settings,
      updatedAt: serverTimestamp()
    });
    console.log("Configurações salvas com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações:", error.code, error.message);
    throw error;
  }
};

export const getSettings = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "settings", userId));
    if (docSnap.exists()) {
      console.log("Configurações carregadas com sucesso");
      return docSnap.data();
    } else {
      console.log("Nenhuma configuração encontrada");
      return null;
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error.code, error.message);
    throw error;
  }
};

// Função para monitorar mudanças de autenticação
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Função para obter o IP do usuário
const getIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erro ao obter IP:', error);
    return 'unknown';
  }
};

export { auth, db };