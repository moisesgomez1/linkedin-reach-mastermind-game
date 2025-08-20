import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type GameAttributes = {
    id: string;
    secret: number[];
    attemptsLeft: number;
    isWin: boolean;
    isOver: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

// which fields are optional on creation
type GameCreationAttributes = Optional<
    GameAttributes,
    'id' | 'isWin' | 'isOver' | 'attemptsLeft' | 'createdAt' | 'updatedAt'
>;

export interface GameInstance
    extends Model<GameAttributes, GameCreationAttributes>,
        GameAttributes {}

const Game = sequelize.define<GameInstance>(
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
