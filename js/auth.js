import { profile } from "./dash.js";

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', handleLoginFormSubmit);

async function handleLoginFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const jwt = await signIn(username, password);
    query(jwt);
}

async function signIn(username, password) {
    const url = 'https://01.kood.tech/api/auth/signin';
    const credentials = btoa(`${username}:${password}`);
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });
  
        if (!response.ok) {
            window.alert("Invalid credentials");
            throw new Error('Invalid credentials');
        }
  
        const data = await response.json();
        document.getElementById('content').innerHTML = '';
        localStorage.setItem('jwt', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function query(jwt) {
    const query = `
        {
        user {
          auditRatio  
          attrs
          xps(where: {originEventId: {_eq: "148"}}) {
            amount
            path
          }
        }
        result (where: {type: {_eq: "user_audit"}}) {
            grade
            object {
              name
            }
          }
        }
    `;

    const url = 'https://01.kood.tech/api/graphql-engine/v1/graphql';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        },
        mode: 'cors', 
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        throw new Error('Query failed');
    }

    const data = await response.json();
    const user = data.data.user[0];
    const auditRatio = user.auditRatio.toFixed(1);
    const grades = data.data.result;
    const country = user.attrs.country;
    const firstName = user.attrs.firstName;
    const lastName = user.attrs.lastName;
    const email = user.attrs.email;
    const city = user.attrs.addressCity;

    profile(firstName, lastName, country, city, email, user.xps, grades, auditRatio);
}

export function logout() {
    localStorage.removeItem('jwt');
    location.reload();
}

window.onload = async () => {
    const jwtCheck = localStorage.getItem('jwt');

    if (jwtCheck) {
        document.getElementById('content').innerHTML = '';
        query(jwtCheck);
    }
};
