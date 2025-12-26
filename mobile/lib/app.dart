import 'package:flutter/material.dart';

class AreaApp extends StatelessWidget {
  const AreaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AREA Mobile',
      theme: ThemeData(primarySwatch: Colors.blue,),
      home: const Scaffold(
        body: Center (
            child: Text('Hello AREA!'),
        ),
      ),
    );
  }
}
