import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type GameAttributes = {
    id: string;
    secret: number[];
    attemptsLeft: number | null; // null for timed mode
    isWin: boolean;
    isOver: boolean;
    startTime: Date | null;
    timeLimit: number | null;
    mode: 'classic' | 'timed';
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
            allowNull: true, // null for timed mode
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
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        timeLimit: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        mode: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'classic',
            validate: {
                isIn: [['classic', 'timed']],
            },
        },
    },
    {
        tableName: 'games',
        timestamps: true,
    }
);

export default Game;
