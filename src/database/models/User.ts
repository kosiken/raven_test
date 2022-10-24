import { Database } from "../db";
import * as bcrypt from 'bcryptjs';
import { AppError, ErrorType } from "../../utils/AppErrors";
import {v4 as uuid} from 'uuid';
import { Model } from "./model";

export interface IUser {
  first_name: string;
  last_name: string;
  user_id: string;
  phone: string;
  id?: number;
  email: string;
  password?: string;
  created_at?: Date;
  logged_out_at?: Date;
}
export class User extends Model {
  public first_name: string;
  public last_name: string;
  public id?: number;
  public user_id: string;
  public phone: string;
  public email: string;
  public created_at: Date;
  public logged_out_at: Date;

  constructor(user: IUser) {
    super();
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.user_id = user.user_id;
    this.phone = user.phone;
    this.email = user.email;
    this.id = user.id;
    this.created_at = user.created_at!;
    this.logged_out_at = user.logged_out_at!;
  
  }

  static async create(user: IUser ): Promise<User | undefined> {
    const database = Database.getInstance();
    const password =  bcrypt.hashSync(user.password!, bcrypt.genSaltSync());
    const user_id = uuid();
    const query = await database.db!.insert({...user, email: user.email.toLowerCase(), password, user_id
    })
    .into("users")
    .onConflict('email')
    .ignore();

    if(!query || query[0] == 0) {
        throw new AppError(ErrorType.EXISTS, new Error('user already exitsts'))
    }
    

    const created = await User.getOne({email: user.email});

    if (created) {
      return new User(created);
    }
    else throw new AppError(ErrorType.INTERNAL_ERROR);
    
  }

  static async getOne(columns: Record<string, any>) {
    const database = Database.getInstance();
    const query = database.db!("users").where(columns).first<User>();
    return (await query) as any as IUser;
  }

  static async validatePassword(user: {password: string;}, password: string) {
    const compare = bcrypt.compareSync(password, user.password);
    return compare;
  }

  static async deleteAll() {
    const database = Database.getInstance();
    const query = database.db!("users").where({}).del();
    return (await query);
  }
}
