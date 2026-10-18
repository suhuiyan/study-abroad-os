import openpyxl
w=openpyxl.load_workbook('china-university-directory-1412-official-links-2026-10-06-v75.xlsx',data_only=True,read_only=True);s=w['รายชื่อ 1412']
for i,r in enumerate(s.iter_rows(min_row=5,max_row=1416,values_only=True),5):
 if r[0] in ('北京市','上海市') and not any(r[j] for j in (5,6,7)): print(i,r[0],r[1],r[2],r[3],r[13])
