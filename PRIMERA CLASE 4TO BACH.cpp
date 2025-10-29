#include<iostream>

using namespace std;

int main(){	
	char nombre[20];
	char apellido[20];
	char direccion[50];
	int edad;
	char genero[20];
	int z;
	
	cout<< "Ingrese su nombre ";
	cin>> nombre;
	cout<< endl;
	
	cout<< "Ingrese su apellido ";
	cin>> apellido;
	cout<< endl;
	
	cout<< "Ingrese su direccion  ";
	cin>> direccion;
	cout<< endl;
	
	cout<< "Ingrese la fecha que nacio ";
	cin>> z;
	cout<< endl;
	
	cout<< "Ingrese su genero ";
	cin>> genero;
	cout<< endl;
	
	edad= 2024-z;
	
	cout<< "Su nombre completo es ";
	cout<< nombre;
	cout<< " ";
	cout<<apellido;
	cout<< endl;
		
	cout<< "Reside en ";
	cout<<direccion;
	cout<< endl;
	
	cout<< "Su edad es ";
	cout<< edad ;
	cout<< endl;
	
	cout<< "Su genero es ";
	cout<< genero;
	cout<< endl;
	cout<< endl;
	}
