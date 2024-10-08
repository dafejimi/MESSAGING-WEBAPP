const express = require('express');
const cors = require('cors');
const corsConfig = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}

const authRoutes = require("./routes/auth.js")

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()

// add env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid= process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

app.options("", cors(corsConfig))
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send("Hello world")
});

app.post('/', (req,res) => {
    const { message, user: sender, type, members} = req.body;

    if(type === 'message.new') {
        members.filter((member) => member.user.id !== sender.id).forEach(({ user }) => {
            if(!user.online) {
                twilioClient.messages.create({
                    body: `You have a message from ${message.user.fullName} - ${message.text}`,
                    messagingServiceSid: messagingServiceSid,
                    to: user.phoneNumber
                })
                .then(() => console.log('Message sent!'))
                .catch(err => console.log(err));
            }
        })
        
        return res.status(200).send('Message Sent! ');
    }

    return res.status(200).send('Not a new message request! ');
})

app.use('/auth', authRoutes)

app.listen(PORT, () => console.log(`Server running on${PORT}`));


