import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Code-first model. Schema changes go through sequelize-cli migrations —
// keep this and migrations/ in sync by hand.
export interface ProfileAttributes {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  imageUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProfileCreation = Optional<ProfileAttributes, 'id' | 'bio' | 'imageUrl'>;

export class Profile
  extends Model<ProfileAttributes, ProfileCreation>
  implements ProfileAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare bio: string | null;
  declare imageUrl: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

let initialized = false;

export function initProfile(sequelize: Sequelize): typeof Profile {
  if (initialized) return Profile;
  Profile.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      imageUrl: { type: DataTypes.STRING(1024), allowNull: true },
    },
    { sequelize, tableName: 'profiles', timestamps: true },
  );
  initialized = true;
  return Profile;
}
