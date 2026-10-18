import openpyxl,collections
w=openpyxl.load_workbook('china-university-directory-1412-official-links-2026-10-06-v77.xlsx',data_only=True,read_only=True);s=w['รายชื่อ 1412'];rs=list(s.iter_rows(min_row=5,max_row=1416,values_only=True));print('total',len(rs),'unique',len(set(r[2] for r in rs)),'covered',sum(any(r[i] for i in (5,6,7)) for r in rs));
for i,r in enumerate(rs,5):
 if r[0]=='河北省' and not any(r[j] for j in (5,6,7)): print(i,r[1],r[2],r[3],r[13])
