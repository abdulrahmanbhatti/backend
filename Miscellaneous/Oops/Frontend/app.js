class Person {
    constructor(name , age ){
        this.name= name ;
        this.age = age ;
    }

    talk(){
        console.log("this is may ");
        
    }
     

}





class Student  extends Person{
    constructor ( name , age ,marks){
        super(name, age )
        this.marks= marks
    }
   
}


class Teacher extends Person {
    constructor ( name , age ,subject){
      super(name, age )
        this.subject= subject
    }
   
}


let std1=new Student ("Abdul Rahman", 12, 21)

