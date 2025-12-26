package com.example.kotlin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LoginScreen()
        }
    }
}

@Composable
fun LoginScreen() {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(30.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Welcome", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1C1C1C))
        Spacer(Modifier.height(6.dp))
        Text("Sign In to continue", fontSize = 18.sp, color = Color(0xFF1C1C1C))

        Spacer(Modifier.height(26.dp))

        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(26.dp))

        Button(
            onClick = { /* Handle login */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(49.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B62FF))
        ) {
            Text("Login", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(26.dp))
        Text("Forgot Password?", fontSize = 14.sp, color = Color(0xFF87879D))
        Spacer(Modifier.height(10.dp))
        Text("Don't have an account? Sign Up", fontSize = 14.sp, color = Color(0xFF87879D))
    }
}
