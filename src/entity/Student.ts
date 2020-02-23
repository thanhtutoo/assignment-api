import {Entity, PrimaryColumn,Generated, Column,Unique} from "typeorm";


@Entity()
@Unique(["student"])
export class Student {

    @PrimaryColumn()
    @Generated('increment')
    student_id: number;

    @Column()
    student: string;
    
    @Column({ default: false })
    is_suspend: boolean;

}