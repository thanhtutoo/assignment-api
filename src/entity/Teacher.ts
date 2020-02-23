import {Entity, PrimaryColumn, Column,Unique, Generated, ManyToMany, JoinTable} from "typeorm";
import {Student} from "./Student";

@Entity()
@Unique(["teacher"])
export class Teacher {

    @PrimaryColumn()
    @Generated('increment')
    teacher_id: number;

    @Column()
    teacher: string;

    @ManyToMany(type => Student)
    @JoinTable()
    students: Student[];
}
