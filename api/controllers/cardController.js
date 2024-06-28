const Card = require('../models/card');


async function createCards() {
    const cartas = [];
    for (let i = 1; i <= 32; i++) {
      const opciones = ['Infantry', 'Cavalry', 'Artillery'];
      const nombre = opciones[(i - 1) % opciones.length]; 
      const carta = await Card.create({ id: i, name: nombre });
      cartas.push(carta);
    }
    return cartas;
  }

module.exports = {
    createCards,
};