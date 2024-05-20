import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onValue, onDisconnect, remove } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwLeH7TRz-S_xLu0hCum2aM9chLtAoUvU",
  authDomain: "even-plating-282320.firebaseapp.com",
  projectId: "even-plating-282320",
  storageBucket: "even-plating-282320.appspot.com",
  messagingSenderId: "952376655211",
  appId: "1:952376655211:web:c04286917d973dcedb602e",
  measurementId: "G-H546PQLKQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('send-button').addEventListener('click', sendMessage);
    
    let currentUser;

    // Firebase Authentication
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            setUserOnline(user.uid);
            listenForChatRequests(user.uid); // Ensure to start listening for chat requests
        } else {
            signInAnonymously(auth).catch(console.error);
        }
    });

    function setUserOnline(userId) {
        const userRef = ref(db, 'users/' + userId);
        set(userRef, {
            online: true
        });
        onDisconnect(userRef).remove();
        listenForOnlineUsers();
    }

    function listenForOnlineUsers() {
        const onlineUsersRef = ref(db, 'users');
        onValue(onlineUsersRef, snapshot => {
            const users = snapshot.val();
            const onlineUsersDiv = document.getElementById('online-users');
            onlineUsersDiv.innerHTML = '';
            for (let userId in users) {
                if (users[userId].online && userId !== currentUser.uid) {
                    const userDiv = document.createElement('div');
                    userDiv.classList.add('user');
                    userDiv.innerText = `User: ${userId}`;
                    userDiv.addEventListener('click', () => sendChatRequest(userId));
                    onlineUsersDiv.appendChild(userDiv);
                }
            }
        });
    }

    function sendChatRequest(userId) {
        const chatRequestRef = ref(db, 'chat-requests/' + userId);
        set(chatRequestRef, {
            from: currentUser.uid
        });
        onDisconnect(chatRequestRef).remove();
    }

    function listenForChatRequests(userId) {
        const chatRequestListenerRef = ref(db, 'chat-requests/' + userId);
        onValue(chatRequestListenerRef, snapshot => {
            const request = snapshot.val();
            if (request) {
                const accept = confirm(`User ${request.from} wants to chat. Accept?`);
                if (accept) {
                    startChat(request.from);
                    remove(chatRequestListenerRef);
                }
            }
        });
    }

    function startChat(userId) {
        alert('Chat started with ' + userId);
        // Implement chat start logic here
    }

    function sendMessage() {
        const input = document.getElementById('message-input');
        const messageText = input.value.trim();

        if (messageText !== '') {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerText = messageText;

            const chatWindow = document.getElementById('chat-window');
            chatWindow.appendChild(messageElement);

            input.value = '';
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }
});