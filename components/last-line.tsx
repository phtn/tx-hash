'use client'

export const LastLine = () => {
  return (
    <main>
      <div className='relative z-content mx-auto w-full max-w-web3-full-screen bg-accent h-96'>
        <div className='w-full md:pb-0 aspect-square h-full justify-center pb-0 sm:aspect-auto sm-only:min-h-[400px] flex flex-col items-center [&amp;&gt;*]:text-center'>
          <div className='flex flex-col items-center justify-center sm:flex-row md:justify-start'>
            <div className='group relative z-10 inline-block'>
              <div className='absolute inset-0 -z-10 -m-0.5 rounded-full bg-linear-to-r from-coral-500 to-quartz-500 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100'></div>
              <a
                target='_self'
                aria-disabled='false'
                className='relative flex w-fit items-center justify-center transition-all duration-300 ease-button-gradient cursor-pointer bg-pureWhite text-neutral-15 web3-primary-solid-btn rounded-full py-3 px-6 [&amp;&gt;*]:text-web3-18 outline-none focus:outline-none'
                href='/contact-sales'>
                <div className='text-center md:max-w-full md:text-left [&amp;_p_a]:!inline portable-text-breaks bg-card flex items-center h-14 px-8'>
                  <h2 className='lg:text-lg font-ct tracking-wide'>Get Started</h2>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
