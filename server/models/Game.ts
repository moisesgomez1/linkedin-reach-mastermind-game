import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

const Game = sequelize.define(
    'Game',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        secret: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
        },
        attemptsLeft: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
        },
        isWin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isOver: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'games',
        timestamps: true,
    }
);

export default Game;
