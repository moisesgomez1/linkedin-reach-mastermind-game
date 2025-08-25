import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type UserAttributes = {
    id: string;
    username: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export interface UserInstance
    extends Model<UserAttributes, UserCreationAttributes>,
        UserAttributes {}

const User = sequelize.define<UserInstance>('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
});

export default User;
