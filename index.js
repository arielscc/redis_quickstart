const axios = require('axios');
const express = require('express');
const redis = require('redis');
const responseTime = require('response-time');


const PORT = 3000;
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.log('Error ' + err);
});

const app = express();

app.use(responseTime());

app.get('/characters', async (req, res) => {
  await redisClient.connect();
  const characters = await redisClient.get('characters');
  if (characters) {
    res.send(characters);
  } else {
    const response = await axios.get('https://rickandmortyapi.com/api/character')
    await redisClient.set('characters', JSON.stringify(response.data));

    res.send(response.data);
  }
  await redisClient.disconnect();
});

app.get('/characters/:id', async (req, res) => {
  await redisClient.connect();
  const id = req.params.id;
  const character = await redisClient.get(`character:${id}`);
  if (character) {
    res.send(character);
  } else {
    const response = await axios.get(`https://rickandmortyapi.com/api/character/${id}`);
    await redisClient.set(`character:${id}`, 'name', response.data);
    res.send(response.data);
  }
  await redisClient.disconnect();
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
