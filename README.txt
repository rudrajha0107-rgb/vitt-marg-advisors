VITT-MARG COMPANY SEARCH (Noida / Greater Noida / Ghaziabad)
=============================================================

1. DATA DOWNLOAD (free)
   - data.gov.in par jaayein, search karein: "Company Master Data Uttar Pradesh"
   - CSV download karein (login / purpose form bharna padta hai).
   - File ka naam kuch bhi ho, is folder me rakh dein, jaise: company_master_UP.csv

2. (Optional) DIRECTORS
   - Directors free data me nahi hote. Paid API (Signzy / Probe42 / Attestr jaisi) se lein.
   - directors.csv banayein, 2 columns: CIN, Director Name (har director ki alag line).

3. PAGES BANAYEIN (computer par Python 3 chahiye)
   python build_directory.py company_master_UP.csv            (sirf companies)
   python build_directory.py company_master_UP.csv directors.csv   (directors ke saath)
   Option: --all-up  = poore UP ki companies (default: sirf Noida, Greater Noida, Ghaziabad)
   Output folder: site_upload/  (companies/ folder + sitemap-companies.xml)

4. UPLOAD
   - Hazaron pages hain, GitHub web upload (100 files ki limit) se nahi hoga.
   - GitHub Desktop install karein -> repo clone karein -> site_upload ke andar ki cheezein
     repo folder me copy karein -> Commit -> Push.
   - robots.txt me ye line jodein:  Sitemap: https://vittmarg.com/sitemap-companies.xml
   - Search Console me sitemap-companies.xml submit karein.

5. UPDATE
   Har 3-6 mahine naya CSV download karke step 3-4 dobara chalayein.

Dhyan rakhein: email IDs publish nahi hote (script unhe skip karti hai). Directors ka sirf naam,
DIN ya personal address nahi. Har page par source aur correction/removal ka email diya hai.
