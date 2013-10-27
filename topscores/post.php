<?php
  $connection = new PDO('sqlite:scores.sqlite3');
  $connection->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
  $a = $connection->prepare("
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY,
    source TEXT,
    score INTEGER,
    sequence TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );")->execute();

  if (empty($_POST['source']) || empty($_POST['score']) || empty($_POST['sequence'])) exit();

  $insert = $connection->prepare("INSERT INTO scores(source, score, sequence) VALUES(?,?,?)");
  $insert->execute(array($_POST['source'], (int)$_POST['score'], $_POST['sequence']));
  echo 'ok';
?>
