import axios from "axios";

let baseURL

if (window.location.origin === 'http://localhost:5173'){
    // baseURL = 'https://ct0.adhealvin.com/api'
    baseURL = 'http://localhost:8080'
} else {
    // baseURL = window.location.origin
    baseURL = 'http://localhost:8080'
}
// console.log(window.location.origin)

export default axios.create({
    // baseURL: "/poleman/api", 
    baseURL: `${baseURL}`,
    Headers: { "Content-Type": "application/json"},
})