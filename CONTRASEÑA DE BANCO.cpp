 #include<iostream>

using namespace std;

int main(){

int contra=271099;
int A;
int i;
int opcion;
do{

cout<<"Ingrese la CONTRASENA ";
cout<< endl;
cin>>A;
if(A==contra){
	cout<<"CONTRASENA correcta";
	cout<< endl;
	
	cout<<"BIENVENIDO";
	cout<< endl;
	
cout<<"Eliga una funcion ";
cout<< endl;
cout<<"Si desea transferir marque 1 ";
cout<< endl;
cout<<"Si desea depositar marque 2 ";
cout<< endl;
cout<<"Si desea extraer efectivo marque 3 ";
cout<< endl;
cout<<"Si desea cambiar su contraseña marque 4 ";
cout<< endl;
cin>> opcion;
}


else{
	cout<< "CONTRASENA INCORRECTA ";
	cout<< endl;

}
}
while(A<0|A>100000000);

switch (opcion){
case 1:
	int n1;
	char n2;
	int r;
	int t;
	cout<< "Ingrese el monto a transferir ";
	cin>> n1;
	cout<< "Ingrese el numero de cuenta a transferir ";
	cin>> n2;
	r=1000;
	t=(r-n1);
	if(n1>r){
		cout<<"Su saldo es unsuficiente";
		cout<< endl;
		cout<< "Su saldo actual es de ";
	cout<< r;
	}
	else{
   

	cout<< "Su transferencia ha sido completada ";
	cout<< endl;
	cout<< "Su saldo actual es de ";
	cout<< t;
}
break;	


case 2:
	int n3;
	int t2;
	int r2;
	cout<< "Ingrese el monto a depositar ";
	cin>> n3;
	cout<< "Su deposito a sido efectuado ";
	cout<< endl;
	r2=1000;
	t2=(n3+r2);
	cout<< "Su saldo actual es de ";
	cout<< t2;
break;	
case 3:
	int n5;
	
	int r3;
	int t3;
	cout<< "Ingrese el cantidad a extraer ";
	cin>> n5;
	r3=1000;
	t3=(r3-n5);
	if(n5>r3){
		cout<<"Su saldo es insuficiente, no puede extraer esa cantidad";
		cout<< endl;
		cout<< "Su saldo actual es de ";
	cout<< r3;
}
	
	else{
	cout<< "Gracias por su preferencia ";
	cout<< endl;
	cout<< "Su saldo actual es de ";
	cout<< t3;
}
	break;	
	case 4:
	int NC;
	

	cout<< "Ingrese CONTRASEÑA NUEVA ";
	cin>> NC;
	
	cout<< "Su CONTRASEÑA NUEVA ES ";
	cout<< endl;
		cout<< NC;
	cout<< endl;
	break;	}

}

