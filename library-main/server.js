// ✅ Complete Server.js code (Backend for Library Management System)
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function: Safe JSON read
function safeReadJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

// Paths
const signupFile = 'signup.json';
const booksFile = 'books.json';
const issueFile = 'issueReturn.json';
const memberFile = 'member.json';

// ✅ Ensure JSON files exist
[signupFile, booksFile, issueFile].forEach(file => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});
if (!fs.existsSync(memberFile)) fs.writeFileSync(memberFile, '{"members": []}');

// ✅ Nodemailer setup (if you want to enable email, configure this)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ashutoshkumarak843329@gmail.com',
        pass: 'ashutosingh@97081'
    }
});

// --- Signup API ---
app.post('/signup', (req, res) => {
    const { id, password, question, answer } = req.body;
    let users = safeReadJson(signupFile);

    if (!id || !password || !question || !answer) {
        return res.status(400).json({ message: 'Please fill all fields!' });
    }

    const existingUser = users.find(user => user.id === id);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists!' });
    }

    const newUser = { id, password, question, answer };
    users.push(newUser);
    fs.writeFileSync(signupFile, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Signup successful!' });

    // Optional: Send email notification
    const mailOptions = {
        from: 'ashutoshkumarak843329@gmail.com',
        to: 'yourcollegeemail@gmail.com',
        subject: 'New Signup Notification',
        text: `New user signed up:\nID: ${newUser.id}\nSecurity Question: ${newUser.question}\nAnswer: ${newUser.answer}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Error sending email:', error);
        else console.log('Signup email sent:', info.response);
    });
});

// Get users (for login)
app.get('/users', (req, res) => {
    const users = safeReadJson(signupFile);
    res.json(users);
});

// Delete user API
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    let users = safeReadJson(signupFile);

    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    users.splice(index, 1);
    fs.writeFileSync(signupFile, JSON.stringify(users, null, 2));

    res.json({ message: 'User removed successfully.' });
});

// --- Book APIs ---
app.get('/books', (req, res) => {
    const books = safeReadJson(booksFile);
    res.json(books);
});

app.post('/books', (req, res) => {
    const { title, author, year, genre } = req.body;
    let books = safeReadJson(booksFile);

    if (!title || !author || !year || !genre) {
        return res.status(400).json({ message: 'Please fill all fields!' });
    }

    books.push({ title, author, year, genre });
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

    res.status(201).json({ message: 'Book added successfully!' });
});

app.delete('/books/:index', (req, res) => {
    let books = safeReadJson(booksFile);
    const index = req.params.index;

    if (index < 0 || index >= books.length) {
        return res.status(400).json({ message: 'Invalid book index.' });
    }

    books.splice(index, 1);
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

    res.json({ message: 'Book removed successfully!' });
});

// --- Issue/Return APIs ---
app.get('/issues', (req, res) => {
    const issues = safeReadJson(issueFile);
    res.json(issues);
});

app.post('/issues', (req, res) => {
    console.log('POST /issues body:', req.body);
    const { studentName, libraryId, issueDate, returnDate, studentEmail, bookTitle } = req.body;
    let issues = safeReadJson(issueFile);

    if (!studentName || !libraryId || !issueDate || !returnDate || !studentEmail || !bookTitle) {
        return res.status(400).json({ message: 'Please fill all fields!' });
    }

    issues.push({ studentName, libraryId, issueDate, returnDate, studentEmail, bookTitle });
    fs.writeFileSync(issueFile, JSON.stringify(issues, null, 2));

    res.status(201).json({ message: 'Book issued successfully!' });
});

app.delete('/issues/:index', (req, res) => {
    let issues = safeReadJson(issueFile);
    const index = req.params.index;

    if (index < 0 || index >= issues.length) {
        return res.status(400).json({ message: 'Invalid issue index.' });
    }

    issues.splice(index, 1);
    fs.writeFileSync(issueFile, JSON.stringify(issues, null, 2));

    res.json({ message: 'Issue record removed successfully!' });
});

// --- Contact form submission API ---
const contactFile = 'contactMessages.json';

// Ensure contactMessages.json exists
if (!fs.existsSync(contactFile)) fs.writeFileSync(contactFile, '[]');

// Helper functions for member.json
function safeReadMembers() {
    try {
        if (!fs.existsSync(memberFile)) return { members: [] };
        const data = fs.readFileSync(memberFile, 'utf8');
        return data ? JSON.parse(data) : { members: [] };
    } catch (error) {
        console.error(`Error reading ${memberFile}:`, error);
        return { members: [] };
    }
}

function safeWriteMembers(data) {
    try {
        fs.writeFileSync(memberFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${memberFile}:`, error);
    }
}

app.post('/contact', (req, res) => {
    const { name, email, phone, reason, message } = req.body;
    console.log('Received contact form submission:', req.body);
    let contacts = safeReadJson(contactFile);

    if (!name || !email || !phone || !reason || !message) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'Please fill all fields!' });
    }

    const newContact = { name, email, phone, reason, message, date: new Date().toISOString() };
    contacts.push(newContact);
    fs.writeFileSync(contactFile, JSON.stringify(contacts, null, 2));

    res.status(201).json({ message: 'Message received successfully!' });
});

app.get('/members', (req, res) => {
    const data = safeReadMembers();
    res.json(data.members);
});

app.post('/members', (req, res) => {
    console.log('POST /members called with body:', req.body);
    const { name, id, department } = req.body;
    if (!name || !id || !department) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'Please fill all fields!' });
    }

    const data = safeReadMembers();
    const existingMember = data.members.find(member => member.id === id);
    if (existingMember) {
        console.log('Duplicate member ID:', id);
        return res.status(409).json({ message: 'Member with this ID already exists!' });
    }

    data.members.push({ name, id, department });
    try {
        safeWriteMembers(data);
    } catch (error) {
        console.error('Error writing member.json:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(201).json({ message: 'Member added successfully!' });
});

app.delete('/members/:id', (req, res) => {
    const memberId = req.params.id;
    const data = safeReadMembers();

    const index = data.members.findIndex(member => member.id === memberId);
    if (index === -1) {
        return res.status(404).json({ message: 'Member not found.' });
    }

    data.members.splice(index, 1);
    safeWriteMembers(data);

    res.json({ message: 'Member removed successfully.' });
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});