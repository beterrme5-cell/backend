import axios from "axios";

export const sendSMS = async (req, res) => {

    try
    {
        const {contactId, message} = req.body;
        const user = req.user;

        const userData = await userModel.findOne({ accountId: user.accountId, userLocationId: user.userLocationId });
        if (!userData) {
            return res.status(400).send({
                message: "User not found",
            });
        }

        const options = {
            method: 'POST',
            url: 'https://services.leadconnectorhq.com/conversations/messages',
            headers: {
              Authorization: 'Bearer 123',
              Version: '2021-04-15',
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            data: {
              type: 'SMS',
              contactId: contactId,
            //   appointmentId: 'string',
            //   attachments: ['string'],
            //   emailFrom: 'string',
            //   emailCc: ['string'],
            //   emailBcc: ['string'],
            //   html: 'string',
              message: 'string',
              subject: 'string',
              replyMessageId: 'string',
            //   templateId: 'string',
            //   scheduledTimestamp: 1669287863,
            //   conversationProviderId: 'string',
            //   emailTo: 'string',
            //   emailReplyMode: 'reply',
              fromNumber: '+1499499299',
              toNumber: '+1439499299'
            }
        };

        const { data } = await axios.request(options);
        console.log(data);

    }
    catch (error)
    {
        console.log(error);
        res.status(400).json({ message: error.message });
    }

};