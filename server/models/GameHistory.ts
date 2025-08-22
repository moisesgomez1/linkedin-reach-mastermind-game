import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type GameHistoryAttributes = {
    id: string;
    gameId: string;
    guess: number[];
    correctNumbers: number;
    correctPositions: number;
    createdAt?: Date;
    updatedAt?: Date;
};

type GameHistoryCreationAttributes = Optional<
    GameHistoryAttributes,
    'id' | 'createdAt' | 'updatedAt'
>;

interface GameHistoryInstance
    extends Model<GameHistoryAttributes, GameHistoryCreationAttributes>,
        GameHistoryAttributes {}

const GameHistory = sequelize.define<GameHistoryInstance>(
    'GameHistory',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        gameId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        guess: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
        },
        correctNumbers: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        correctPositions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'game_history',
        timestamps: true,
    }
);

export default GameHistory;
