<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Report Card</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }
        h2 {
            text-align: center;
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #000;
            padding: 6px;
        }
        th {
            background: #f2f2f2;
        }
        .meta td {
            border: none;
            padding: 3px;
        }
    </style>
</head>
<body>

<h2>REPORT CARD</h2>
<p style="text-align:center;">
    School Year {{ $schoolYear->name }}
</p>

<table class="meta">
    <tr>
        <td width="30%"><strong>Student Name:</strong></td>
        <td>{{ $student->last_name }}, {{ $student->first_name }} {{ $student->middle_name }}</td>
    </tr>
    <tr>
        <td><strong>Student No:</strong></td>
        <td>{{ $student->student_no }}</td>
    </tr>
    <tr>
        <td><strong>Grade & Section:</strong></td>
        <td>Grade {{ $section->grade_level }} - {{ $section->name }}</td>
    </tr>
</table>

<table>
    <thead>
        <tr>
            <th>Subject</th>
            <th width="120">Final Grade</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($subjects as $s)
            <tr>
                <td>{{ $s['subject'] }}</td>
                <td align="center">
                    {{ $s['final_grade'] !== null ? $s['final_grade'].'%' : '—' }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>

<br><br>

<table class="meta">
    <tr>
        <td width="50%">
            Prepared by:<br><br>
            _______________________<br>
            Class Adviser
        </td>
        <td align="right">
            Date Issued:<br>
            {{ now()->format('F d, Y') }}
        </td>
    </tr>
</table>

</body>
</html>
