#include <iostream>
using namespace std;

int pene() {
    double num1, num2;

    cout << "Ingrese el primer numero: ";
    cin >> num1;
    cout << "Ingrese el segundo numero: ";
    cin >> num2;

    if (num1 == num2) {
        cout << "Ambos numeros son iguales, no se puede dividir uno entre el otro." << endl;
    } else {
        double mayor, menor;

        if (num1 > num2) {
            mayor = num1;
            menor = num2;
        } else {
            mayor = num2;
            menor = num1;
        }

        if (menor == 0) {
            cout << "No se puede dividir entre cero." << endl;
        } else {
            double resultado = mayor / menor;
            cout << "El mayor es: " << mayor << endl;	
            cout << "El menor es: " << menor << endl;
            cout << "La division del mayor entre el menor es: " << resultado << endl;
        }
    }

    return 0;
}

