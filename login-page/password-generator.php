<?php
$return = password_hash('PLACEHOLDER', PASSWORD_DEFAULT, ['cost' => 10]);
echo($return);