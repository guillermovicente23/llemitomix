 #include<iostream>

using namespace std;

int main(){

int contra=5000;
int A;
int i;

do{

cout<<"Ingrese la CONTRASENA ";
cout<< endl;
cin>>A;
}
while(A<5000 && A>0);

if(A==contra){
	cout<<"CONTRASENA correcta";
	cout<< endl;
}

else{
	cout<< "CONTRASENA INCORRECTA ";
	cout<< endl;

}
}



