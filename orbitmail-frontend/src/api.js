import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000'
})

export const getEmails = () => api.get('/emails')
export const sendEmail = (data) => api.post('/emails', data)
export const deleteEmail = (id) => api.delete(`/emails/${id}`)