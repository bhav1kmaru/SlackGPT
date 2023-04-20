const { App } = require("@slack/bolt");
const axios = require("axios");
const { OpenAIApi, Configuration } = require("openai");
require('dotenv').config()

const slackBotToken = process.env.SLACK_BOT_TOKEN;
const chatGptApiKey = process.env.OPENAI_API_KEY;

const app = new App({
  token: slackBotToken,
  socketMode: true,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken:
    process.env.SLACK_APP_TOKEN,
});

const configuration=new Configuration({
  apiKey:chatGptApiKey,
})

const openai=new OpenAIApi(configuration)

app.message(async ({ message, say }) => {
  console.log(message);
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: message.text,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    const { choices } = response.data;
    const { text } = choices[0];

    console.log(`Received message "${message.text}", responded with "${text}"`);

    await say(text);
  } catch (err) {
    console.error(err);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  
  console.log("Bot is running!");
})();
