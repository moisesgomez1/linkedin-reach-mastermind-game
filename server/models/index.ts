//index file to create associations later. Also to make sure that we are importing so the models could sync to the db.
import Game from './Game';
import GameHistory from './GameHistory';
import User from './User';

User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });

Game.hasMany(GameHistory, { foreignKey: 'gameId', as: 'history' });
GameHistory.belongsTo(Game, { foreignKey: 'gameId' });

export { Game, GameHistory, User };